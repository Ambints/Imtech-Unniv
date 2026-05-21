import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { TenantConnectionService } from '../tenants/tenant-connection.service';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('portail/enseignant/test')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('enseignant', 'responsable_pedagogique', 'admin')
export class TestEnseignantController {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private readonly tenantConnection: TenantConnectionService,
  ) {}

  private getTenantId(req: Request): string {
    return req.headers['x-tenant-id'] as string;
  }

  @Get('simple')
  async testSimple(@CurrentUser() user: any, @Req() req: Request) {
    const tenantId = this.getTenantId(req);
    
    console.log('=== TEST SIMPLE ===');
    console.log('User ID:', user.id);
    console.log('Tenant ID:', tenantId);
    
    try {
      // Test 1: Résolution du schema
      await this.tenantConnection.setTenantSchema(tenantId);
      console.log('✅ Schema résolu');
      
      // Test 2: Query simple
      const result = await this.dataSource.query(`
        SELECT COUNT(*) as count FROM enseignant WHERE actif = true
      `);
      console.log('✅ Query exécutée:', result);
      
      return {
        success: true,
        userId: user.id,
        tenantId,
        enseignantsCount: result[0]?.count || 0
      };
    } catch (error) {
      console.error('❌ Erreur:', error);
      if (error instanceof Error) {
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
      }
      throw error;
    }
  }
}

// Made with Bob
