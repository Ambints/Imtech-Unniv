export declare class Annonce {
    id: string;
    titre: string;
    contenu: string;
    typeAnnonce: string;
    cible: string;
    parcoursId: string;
    publie: boolean;
    datePublication: Date;
    dateExpiration: Date;
    auteurId: string;
    photoUrl: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Notification {
    id: string;
    utilisateurId: string;
    titre: string;
    message: string;
    typeNotification: string;
    lue: boolean;
    lueAt: Date;
    lien: string;
    createdAt: Date;
}
export declare class Message {
    id: string;
    expediteurId: string;
    destinataireId: string;
    sujet: string;
    contenu: string;
    lu: boolean;
    luAt: Date;
    parentId: string;
    createdAt: Date;
}
