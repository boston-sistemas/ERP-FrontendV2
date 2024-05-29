import React from "react";

const columns = [
  "Orden",
  "Fecha",
  "Tejeduría",
  "Programado (kg)",
  "Consumido (kg)",
  "Restante (kg)",
  "Merma",
  "Progreso",
  "Estado",
];

const Tabla2 = () => {
  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Ordenes Cerradas - Por Liquidar
      </h4>

      <div className="flex flex-col">
        <div className="grid grid-cols-9 rounded-sm bg-gray-2 dark:bg-meta-4">
          {columns.map((column, index) => (
            <div key={index} className="p-2.5 text-center xl:p-5">
              <h5 className="text-sm font-medium uppercase xsm:text-base">
                {column}
              </h5>
            </div>
          ))}
        </div>

        {/* Aquí puedes mapear datos si es necesario en el futuro */}
      </div>
    </div>
  );
};

export default Tabla2;
