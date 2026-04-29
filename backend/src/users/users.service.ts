import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { SuperAdmin } from './super-admin.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    @InjectRepository(SuperAdmin) private superAdminRepo: Repository<SuperAdmin>,
  ) {}

  async create(dto: any): Promise<any> {
    const exists = await this.repo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email deja utilise');
    const password = await bcrypt.hash(dto.password || 'Imtech@2024!', 12);
    return this.repo.save(this.repo.create({ ...dto, password }));
  }

  async findAll(tid?: string, role?: string): Promise<any[]> {
    const where: any = {};
    if (role) where.role = role;
    return this.repo.find({ where, select: ['id','prenom','nom','email','role','actif','createdAt','telephone','photoUrl'] });
  }

  async findOne(id: string): Promise<any> {
    const u = await this.repo.findOne({ where: { id } });
    if (!u) throw new NotFoundException('Utilisateur introuvable');
    return u;
  }

  async findByEmail(email: string): Promise<any> {
    return this.repo.findOne({ where: { email } });
  }

  async findSuperAdminByEmail(email: string): Promise<SuperAdmin | null> {
    return this.superAdminRepo.findOne({ where: { email } });
  }

  async updateSuperAdminLastLogin(id: string): Promise<void> {
    await this.superAdminRepo.update(id, { derniereConnexion: new Date() });
  }

  async update(id: string, dto: any): Promise<any> {
    const u = await this.findOne(id);
    if (dto.password) dto.password = await bcrypt.hash(dto.password, 12);
    return this.repo.save({ ...u, ...dto });
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async updateRefreshToken(id: string, token: string | null): Promise<void> {
    await this.repo.update(id, { tokenReset: token, tokenResetExpiry: token ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null });
  }
}