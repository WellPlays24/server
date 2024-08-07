import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { DoorHistory } from './entities/historial.entity';
import * as moment from 'moment';

@Injectable()
export class DoorService {
    constructor(
        @InjectRepository(DoorHistory)
        private readonly doorHistoryRepository: Repository<DoorHistory>
    ) { }

    async toggleRelay(): Promise<{ status: boolean, msj: string }> {
        const url = `https://jsonplaceholder.typicode.com/posts/1`; // Servicio de ESP32 que activa la puerta
        try {
            const response = await axios.get(url);
            return { status: response.status === 200, msj: response.data };
        } catch (error) {
            console.error('Error making the request:', error);
            return { status: false, msj: error };
        }

    }

    async saveDoorHistoryByUser(id_usuario: number) {
        const now = moment().utc().toDate()
        try {
            const newDoorHistory = await this.doorHistoryRepository.save({ id_usuario: id_usuario, fecha: now })
            if (newDoorHistory) {
                return {
                    status: true,
                    code: 0,
                    msj: "Se ha guardado correctamente",
                };
            } else {
                return {
                    status: false,
                    code: -1,
                    msj: "Se ha producido un error al guardar",
                };
            }
        } catch (e) {
            return { status: false, code: -1, msj: "Ha ocurrido un error al guardar: " + e };
        }
    }

    async getDoorHistoryByUser(fecha_inicio: string, fecha_fin: string) {
        try {
            const doorHistory = await this.doorHistoryRepository.createQueryBuilder('record')
                .leftJoinAndSelect('record.usuario', 'usuario')
                .where('DATE(record.fecha) BETWEEN :fecha_inicio AND :fecha_fin', { fecha_inicio, fecha_fin })
                .select([
                    'record.id_usuario',
                    'record.fecha',
                    'usuario.nombre',
                    'usuario.apellido',
                ])
                .orderBy('record.id_historial_puerta', 'DESC')
                .getMany();

            if (doorHistory.length != 0) {
                // Convertir la fecha a la zona horaria correcta antes de enviarla al cliente
                const doorHistoryConverted = doorHistory.map(record => ({
                    ...record,
                    fecha: moment(record.fecha).tz('America/Guayaquil').format('YYYY-MM-DD HH:mm:ss')
                }));

                return {
                    status: true,
                    code: 0,
                    msj: "Listado correcto",
                    data: doorHistoryConverted
                };
            } else {
                return {
                    status: false,
                    code: -1,
                    data: [],
                    msj: "No hay historial disponible para los parámetros ingresados",
                };
            }

        } catch (e) {
            return { status: false, code: -1, msj: "Ha ocurrido un error al listar: " + e };
        }
    }
}
