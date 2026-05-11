import 'reflect-metadata';
import dotenv from "dotenv";
import { DataSource } from 'typeorm';
import { User } from '../modules/users/user.entity';


dotenv.config();
export const AppDataSource = new DataSource({
  type: 'mssql',

  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  synchronize: true, // never true in real projects
  logging: true,

  entities: [User],
  migrations: [__dirname + '/../migrations/*.{ts,js}'],

  options: {
    encrypt: false,
    trustServerCertificate: true,
  },

});
