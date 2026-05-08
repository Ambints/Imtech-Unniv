### 1. Table `signature_electronique`
```sql
CREATE TABLE signature_electronique (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_document VARCHAR(50) NOT NULL, -- 'diplome', 'convention', 'decision', 'autre'
    document_id UUID NOT NULL,
    signataire_id UUID NOT NULL REFERENCES utilisateur(id),
    signature_hash TEXT NOT NULL, -- Hash cryptographique de la signature
    date_signature TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET,
    metadata JSONB, -- Informations supplémentaires
    statut VARCHAR(20) DEFAULT 'valide', -- 'valide', 'revoque'
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Table `validation_parcours`
```sql
CREATE TABLE validation_parcours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parcours_id UUID NOT NULL REFERENCES parcours(id),
    type_action VARCHAR(30) NOT NULL, -- 'ouverture', 'fermeture', 'modification'
    validateur_id UUID NOT NULL REFERENCES utilisateur(id),
    date_validation TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    commentaire TEXT,
    statut VARCHAR(20) DEFAULT 'approuve', -- 'approuve', 'rejete', 'en_attente'
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. Table `convention_partenariat`
```sql
CREATE TABLE convention_partenariat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titre VARCHAR(255) NOT NULL,
    type_partenaire VARCHAR(50) NOT NULL, -- 'eglise', 'diocese', 'universite', 'entreprise'
    nom_partenaire VARCHAR(255) NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE,
    document_url TEXT,
    statut VARCHAR(30) DEFAULT 'en_attente', -- 'en_attente', 'signe', 'actif', 'expire'
    signataire_president_id UUID REFERENCES utilisateur(id),
    date_signature_president TIMESTAMPTZ,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Table `delegation_signature`
```sql
CREATE TABLE delegation_signature (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delegant_id UUID NOT NULL REFERENCES utilisateur(id), -- Le President
    delegataire_id UUID NOT NULL REFERENCES utilisateur(id), -- Secrétaire Général
    type_document VARCHAR(50) NOT NULL, -- Type de documents délégués
    date_debut DATE NOT NULL,
    date_fin DATE,
    actif BOOLEAN DEFAULT TRUE,
    conditions TEXT, -- Conditions de la délégation
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5. Table `validation_recrutement`
```sql
CREATE TABLE validation_recrutement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidat_nom VARCHAR(100) NOT NULL,
    candidat_prenom VARCHAR(100) NOT NULL,
    poste VARCHAR(100) NOT NULL,
    departement_id UUID REFERENCES departement(id),
    type_recrutement VARCHAR(30) NOT NULL, -- 'strategique', 'standard'
    validateur_id UUID REFERENCES utilisateur(id),
    date_validation TIMESTAMPTZ,
    statut VARCHAR(30) DEFAULT 'en_attente', -- 'en_attente', 'approuve', 'rejete'
    commentaire TEXT,
    salaire_propose DECIMAL(12,2),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6. Table `validation_investissement`
```sql
CREATE TABLE validation_investissement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    montant DECIMAL(15,2) NOT NULL,
    categorie VARCHAR(50) NOT NULL, -- 'infrastructure', 'equipement', 'autre'
    demandeur_id UUID NOT NULL REFERENCES utilisateur(id),
    validateur_id UUID REFERENCES utilisateur(id),
    date_validation TIMESTAMPTZ,
    statut VARCHAR(30) DEFAULT 'en_attente', -- 'en_attente', 'approuve', 'rejete'
    commentaire TEXT,
    priorite VARCHAR(20) DEFAULT 'normale', -- 'haute', 'normale', 'basse'
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7. Table `arbitrage_discipline`
```sql
CREATE TABLE arbitrage_discipline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incident(id),
    arbitre_id UUID NOT NULL REFERENCES utilisateur(id), -- Le President
    date_arbitrage TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decision TEXT NOT NULL,
    sanction_finale VARCHAR(50), -- 'avertissement', 'exclusion_temporaire', 'exclusion_definitive', 'aucune'
    commentaire TEXT,
    statut VARCHAR(20) DEFAULT 'definitif', -- 'definitif', 'en_appel'
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 8. Table `validation_calendrier`
```sql
CREATE TABLE validation_calendrier (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    annee_academique_id UUID NOT NULL REFERENCES annee_academique(id),
    validateur_id UUID NOT NULL REFERENCES utilisateur(id),
    date_validation TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    statut VARCHAR(30) DEFAULT 'approuve', -- 'approuve', 'rejete', 'en_revision'
    commentaire TEXT,
    version INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```}
```



