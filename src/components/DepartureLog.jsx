import React from "react";

export default function DepartureLog({ lines = [], lang = 'zh' }) {
  if (!Array.isArray(lines) || lines.length === 0) {
    return (
      <div className="text-center text-gray-400 mt-4">
        {lang === 'zh' ? '暂无结果' : 'No results yet'}
      </div>
    );
  }

  // 按线路分组
  const groupedLines = lines.reduce((acc, item) => {
    const key = item.line || "未知线路";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  // 多语言状态映射
  const getStatusText = (status) => {
    if (lang === 'zh') return status;
    if (status.includes('取消')) return '❌ Cancelled';
    if (status.includes('延误')) return status.replace('延误', 'Delayed');
    if (status.includes('准点')) return '✅ On time';
    return status;
  };

  return (
    <div className="space-y-6 mt-6">
      {Object.entries(groupedLines).map(([line, items]) => (
        <div
          key={line}
          className="bg-white rounded-xl shadow-lg p-5 border border-gray-200"
        >
          <h2 className="text-lg font-bold text-blue-700 mb-4">
            🚋 {line} {lang === 'zh' ? '路线' : ''}
          </h2>
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between border-b last:border-none pb-2"
              >
                {/* 左边：目的地 + 时间 */}
                <div>
                  <div className="text-sm font-semibold text-gray-800">
                    {item.destination}
                  </div>
                  <div className="text-xs text-gray-500">
                    ⏱ {lang === 'zh' ? '预计' : 'at'} {item.time} · {getStatusText(item.status)}
                  </div>
                </div>

                {/* 右边：分钟数 */}
                <div className="text-right text-sm text-gray-800 font-medium min-w-[3rem]">
                  {lang === 'zh' ? `${item.mins} 分钟` : `in ${item.mins} min`}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
