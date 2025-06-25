import React from "react";

export default function DepartureLog({ logs }) {
  if (!Array.isArray(logs)) {
    return (
      <div className="p-4 bg-gray-100 rounded-md text-gray-700 whitespace-pre-wrap">
        {logs}
      </div>
    );
  }

  // 分组：按线路 line 聚合
  const groupedLines = logs.reduce((acc, item) => {
    const key = item.line || "未知线路";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6 mt-6">
      {Object.entries(groupedLines).map(([line, items]) => (
        <div key={line}>
          <h2 className="text-xl font-bold text-blue-800 mb-3">
            {line} 路线
          </h2>
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg shadow-md px-4 py-3 flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold text-gray-900">
                    {item.destination}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    🕒 预计 {item.time} · {item.status}
                  </div>
                </div>
                <div className="text-right text-lg font-bold text-gray-800 min-w-[3rem]">
                  {item.mins} 分钟
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
