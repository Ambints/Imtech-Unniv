import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * WebSocket Gateway pour les notifications en temps réel
 * Utilisé pour les alertes disciplinaires et les incidents d'examen
 */
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/surveillance',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedClients: Map<string, { socket: Socket; tenantId: string; userId: string; role: string }> = new Map();

  handleConnection(client: Socket) {
    const tenantId = client.handshake.query.tenantId as string;
    const userId = client.handshake.query.userId as string;
    const role = client.handshake.query.role as string;

    if (!tenantId || !userId) {
      this.logger.warn(`Client ${client.id} rejected: missing tenantId or userId`);
      client.disconnect();
      return;
    }

    this.connectedClients.set(client.id, { socket: client, tenantId, userId, role });
    
    // Rejoindre les rooms appropriées
    client.join(`tenant:${tenantId}`);
    client.join(`user:${userId}`);
    if (role) {
      client.join(`role:${role}`);
    }

    this.logger.log(
      `Client connected: ${client.id} (Tenant: ${tenantId}, User: ${userId}, Role: ${role})`,
    );
    this.logger.log(`Total connected clients: ${this.connectedClients.size}`);
  }

  handleDisconnect(client: Socket) {
    const clientInfo = this.connectedClients.get(client.id);
    if (clientInfo) {
      this.logger.log(
        `Client disconnected: ${client.id} (Tenant: ${clientInfo.tenantId})`,
      );
      this.connectedClients.delete(client.id);
    }
  }

  /**
   * Envoie une alerte disciplinaire au secrétariat
   */
  notifyAlerteDisciplinaire(
    tenantId: string,
    alerte: {
      id: string;
      type: string;
      etudiantId: string;
      message: string;
      gravite: 'faible' | 'moyenne' | 'haute' | 'critique';
    },
  ) {
    this.server.to(`tenant:${tenantId}`).emit('alerte:disciplinaire', {
      ...alerte,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(
      `Alerte disciplinaire envoyée pour tenant ${tenantId}: ${alerte.type}`,
    );
  }

  /**
   * Notifie un incident d'examen en temps réel
   */
  notifyIncidentExamen(
    tenantId: string,
    incident: {
      configExamenId: string;
      salleId: string;
      rapport: string;
      gravite: 'mineure' | 'moyenne' | 'majeure' | 'critique';
    },
  ) {
    this.server.to(`tenant:${tenantId}`).emit('incident:examen', {
      ...incident,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(
      `Incident examen notifié pour tenant ${tenantId}: ${incident.salleId}`,
    );
  }

  /**
   * Notifie une absence répétée
   */
  notifyAbsenceRepetee(
    tenantId: string,
    data: {
      etudiantId: string;
      nombreAbsences: number;
      seuilAtteint: boolean;
    },
  ) {
    this.server.to(`tenant:${tenantId}`).emit('alerte:absence', {
      ...data,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(
      `Alerte absence pour étudiant ${data.etudiantId} (${data.nombreAbsences} absences)`,
    );
  }

  /**
   * Notifie une demande d'autorisation de sortie
   */
  notifyDemandeAutorisation(
    tenantId: string,
    autorisation: {
      id: string;
      etudiantId: string;
      type: string;
      dateDebut: Date;
      dateFin: Date;
      estMineur: boolean;
    },
  ) {
    // Envoyer aux surveillants uniquement
    this.server
      .to(`tenant:${tenantId}`)
      .to('role:surveillant_general')
      .emit('autorisation:nouvelle', {
        ...autorisation,
        timestamp: new Date().toISOString(),
      });

    this.logger.log(
      `Nouvelle demande d'autorisation pour tenant ${tenantId}: ${autorisation.id}`,
    );
  }

  /**
   * Notifie la validation d'une autorisation
   */
  notifyAutorisationValidee(
    tenantId: string,
    userId: string,
    autorisation: {
      id: string;
      approuve: boolean;
      motifRefus?: string;
    },
  ) {
    // Envoyer à l'utilisateur concerné
    this.server.to(`user:${userId}`).emit('autorisation:validee', {
      ...autorisation,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(
      `Autorisation ${autorisation.approuve ? 'approuvée' : 'refusée'}: ${autorisation.id}`,
    );
  }

  /**
   * Notifie un nouveau suivi moral
   */
  notifySuiviMoral(
    tenantId: string,
    suivi: {
      id: string;
      etudiantId: string;
      sujet: string;
      prochainRdv?: Date;
    },
  ) {
    this.server.to(`tenant:${tenantId}`).emit('suivi:moral', {
      ...suivi,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Nouveau suivi moral créé: ${suivi.id}`);
  }

  /**
   * Notifie une convocation au conseil de discipline
   */
  notifyConvocationConseil(
    tenantId: string,
    userId: string,
    conseil: {
      id: string;
      etudiantId: string;
      dateConseil: Date;
      motif: string;
    },
  ) {
    // Envoyer à l'étudiant et aux parents
    this.server.to(`user:${userId}`).emit('conseil:convocation', {
      ...conseil,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(
      `Convocation conseil de discipline envoyée: ${conseil.id}`,
    );
  }

  /**
   * Broadcast d'un message général
   */
  @SubscribeMessage('broadcast')
  handleBroadcast(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tenantId: string; message: string },
  ) {
    const clientInfo = this.connectedClients.get(client.id);
    if (clientInfo && clientInfo.tenantId === data.tenantId) {
      this.server.to(`tenant:${data.tenantId}`).emit('broadcast', {
        message: data.message,
        from: clientInfo.userId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Ping pour maintenir la connexion
   */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  /**
   * Obtenir les statistiques de connexion
   */
  getConnectionStats(tenantId: string) {
    let count = 0;
    const roles: Record<string, number> = {};

    this.connectedClients.forEach((clientInfo) => {
      if (clientInfo.tenantId === tenantId) {
        count++;
        roles[clientInfo.role] = (roles[clientInfo.role] || 0) + 1;
      }
    });

    return { totalConnected: count, byRole: roles };
  }
}

// Made with Bob