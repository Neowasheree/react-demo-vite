import React from "react";

export default function DepartureLog({ logs }) {
  if (!Array.isArray(logs)) {
    return (
      <div className="p-4 bg-gray-100 rounded-md text-gray-700 whitespace-pre-wrap">
        {logs}
      </div>
    );
  }

  // 按线路名分组
  const groupedLines = logs.reduce((acc, item) => {
    const key = item.line || "未知线路";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6 mt-6">
      {Object.entries(groupedLines).map(([line, items]) => (
        <div
          key={line}
          className="bg-white rounded-xl shadow-lg p-5 border border-gray-200"
        >
          <h2 className="text-lg font-bold text-blue-700 mb-4">
            🚋 {line} 路线
          </h2>
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between border-b last:border-none pb-2"
              >
                {/* 左侧内容 */}
                <div>
                  <div className="text-sm font-semibold text-gray-800">
                    {item.destination}
                  </div>
                  <div className="text-xs text-gray-500">
                    ⏱ 预计 {item.time} · {item.status}
                  </div>
                </div>

                {/* 右侧分钟数 */}
                <div className="text-right text-sm text-gray-800 font-medium min-w-[3rem]">
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
