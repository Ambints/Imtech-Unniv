export declare class User {
    id: string;
    email: string;
    password: string;
    nom: string;
    prenom: string;
    telephone: string;
    photoUrl: string;
    role: string;
    actif: boolean;
    emailVerifie: boolean;
    derniereConnexion: Date;
    tokenReset: string;
    tokenResetExpiry: Date;
    createdAt: Date;
    updatedAt: Date;
}
