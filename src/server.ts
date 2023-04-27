import { readdir } from 'node:fs/promises';
import { eachLine } from 'line-reader';

type DriverBond = {
  register: string;
  bond_start: string;
  bond_end: string;
};

async function readTXFiles() {
  const files = await readdir('./archives/test', { encoding: 'utf8' });

  let driversbonds: DriverBond[] = [];

  try {
    const iterateThrough = async (file: string) => {
      return new Promise((resolve) => {
        eachLine(`./archives/test/${file}`, (line, lastLine) => {
          if (line.startsWith('010')) {
            const codeOfOperation = line.slice(52, 55);
            const registerWithZeroes = line.slice(22, 32);
            const bondInSeconds = Number(line.slice(47, 52));

            const register = Number(registerWithZeroes)
              .toString()
              .padStart(6, '0');

            const totalMinutes = Math.floor(bondInSeconds / 60);
            const seconds = bondInSeconds % 60;
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;

            const formatedBondTime = `${String(hours).padStart(
              2,
              '0'
            )}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
              2,
              '0'
            )}`;

            if (codeOfOperation === '001') {
              const bondStart = formatedBondTime;

              const driverAlreadyExistsIndex = driversbonds.findIndex(
                (item) => item.register === register
              );

              if (driverAlreadyExistsIndex >= 0) {
                const driverBond = driversbonds[driverAlreadyExistsIndex];
                const itemHours = driverBond.bond_start.slice(0, 2);
                const itemMinutes = driverBond.bond_start.slice(3, 5);

                if (Number(itemHours) === hours) {
                  if (Number(itemMinutes) > minutes) {
                    driversbonds[driverAlreadyExistsIndex].bond_start =
                      bondStart;
                  }
                } else {
                  if (Number(itemHours) > hours) {
                    driversbonds[driverAlreadyExistsIndex].bond_start =
                      bondStart;
                  }
                }
              } else {
                driversbonds.push({
                  register,
                  bond_start: bondStart,
                  bond_end: '',
                });
              }
            }

            if (codeOfOperation === '004') {
              const bondEnd = formatedBondTime;

              const index = driversbonds.findIndex(
                (item) => item.register === register
              );

              driversbonds[index].bond_end = bondEnd;
            }
          }

          if (lastLine) {
            resolve('');
          }
        });
      });
    };

    async function read() {
      for (const file of files) {
        await iterateThrough(file);
      }
    }

    await read();
  } catch (error) {
    console.error(error);
  }

  console.log(driversbonds);
}

readTXFiles();
