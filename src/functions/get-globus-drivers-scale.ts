import oracledb from 'oracledb';
import { localConnection } from '../../connections';

type DriverScale = [
  date: string,
  line: string,
  turn: string,
  register: string,
  name: string,
  garage_out_time: string,
  departure_start: string,
  departure_end: string,
  guide_line: string,
  guide_start: string,
  guide_end: string
];

export async function getDriversScaleFromGlobus() {
  try {
    const connection = await oracledb.getConnection(localConnection);

    if (connection) {
      const result = await connection.execute<DriverScale>(
        `select * from VW_ESCALAXGUIA eg where eg.DAT_ESCALA = to_date('17/04/2023', 'dd/mm/yyyy')`
      );

      const globusDriversScale = result.rows?.map((row) => {
        return {
          date: row[0].toString(),
          line: row[1],
          turn: row[2],
          register: row[3],
          name: row[4],
          garage_out_time: row[5],
          departure_start: row[6],
          departure_end: row[7],
          guide_line: row[8],
          guide_start: row[9],
          guide_end: row[10],
        };
      });

      connection.close();

      return {
        globusDriversScale,
      };
    }
  } catch (error) {
    console.log(error);
  }
}
