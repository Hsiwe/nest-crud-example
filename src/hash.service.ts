/**
 * If number of hashing services starts to grow - consider creating a separate module and dividing
 * the interface from implementations.
 */
import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';

export interface IHashService {
  hash(str: string): Promise<string>;
  /**
   * @param str plain data
   * @param hash encrypted data to compare against
   */
  compare(str: string, hash: string): Promise<boolean>;
}
export const IHashService = Symbol('IHashService');

@Injectable()
export class BcryptHashingService implements IHashService {
  private rounds = 10;
  hash(str: string): Promise<string> {
    return hash(str, this.rounds);
  }
  compare(str: string, hash: string): Promise<boolean> {
    return compare(str, hash);
  }
}
