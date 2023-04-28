import oracledb from 'oracledb';
import path from 'path';
import { readTXFiles } from './functions/convert-udpgarage-tx';
import { getDriversScaleFromGlobus } from './functions/get-globus-drivers-scale';

type DriverScaleMerged = {
  date: string;
  line: string;
  turn: string;
  register: string;
  name: string;
  card_bond_start: string;
  card_bond_end: string;
  garage_out_time: string;
  departure_start: string;
  departure_end: string;
  guide_line: string;
  guide_start: string;
  guide_end: string;
};

async function executeServer() {
  oracledb.initOracleClient({
    libDir: path.join(process.cwd(), 'instantclient_21_9'),
  });

  const mergedScale: DriverScaleMerged[] = [];

  const riocardResult = await readTXFiles();
  const globusResult = await getDriversScaleFromGlobus();

  const globusDriversScale = globusResult!.globusDriversScale!;

  riocardResult?.forEach((rc) => {
    const index = globusDriversScale.findIndex(
      (glb) => glb.register === rc.register
    );

    mergedScale.push({
      card_bond_start: rc.bond_start,
      card_bond_end: rc.bond_end,
      ...globusDriversScale[index],
    });
  });

  console.log(mergedScale);
}

executeServer();
