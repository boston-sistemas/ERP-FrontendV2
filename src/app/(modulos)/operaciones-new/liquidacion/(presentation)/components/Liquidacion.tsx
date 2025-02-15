const Liquidacion = () => {
  return (
    <div>
      <h1 className="text-xl font-bold">Liquidación</h1>
      <table className="min-w-full border-collapse border border-gray-200">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">Columna 1</th>
            <th className="border border-gray-300 p-2">Columna 2</th>
            <th className="border border-gray-300 p-2">Columna 3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 p-2">Dato 1</td>
            <td className="border border-gray-300 p-2">Dato 2</td>
            <td className="border border-gray-300 p-2">Dato 3</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Liquidacion;
