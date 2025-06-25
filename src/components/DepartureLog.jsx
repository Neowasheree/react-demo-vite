import { motion } from 'framer-motion';

export default function DepartureLog({ lines }) {
  console.log('📦 grouped lines:', lines);
  if (!Array.isArray(lines) || lines.length === 0) return null;

  const grouped = lines.reduce((acc, item) => {
    const key = item.line;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const getColorClass = (line) => {
    if (line.includes('20')) return 'bg-cyan-500';
    if (line.includes('21')) return 'bg-amber-600';
    if (line.includes('N20')) return 'bg-teal-600';
    return 'bg-gray-400';
  };

  const renderStatus = (status) => {
    if (status.includes('Cancelled')) return '❌ 已取消';
    if (status.includes('Delayed')) return `🚨 延误 ${status.split('+')[1]}`;
    return '✅ 准点';
  };

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([line, items]) => (
        <motion.div
          key={line}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-md p-4"
        >
          {/* 线路头部 */}
          <div className="flex items-center mb-3">
            <div
              className={`text-white px-2 py-1 rounded text-sm font-bold ${getColorClass(
                line
              )}`}
            >
              {line}
            </div>
            <div className="ml-2 font-semibold text-gray-800 text-base">
              路线 {line}
            </div>
          </div>

          {/* 班次内容 */}
          <div className="divide-y divide-gray-100">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start py-3">
                {/* 左侧内容 */}
                <div>
                  <div className="text-base font-medium text-gray-900">
                    {item.destination}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 leading-snug">
                    ⏱ 预计 {item.time}
                    <br />
                    {renderStatus(item.status)}
                  </div>
                </div>

                {/* 右侧时间 */}
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {item.mins} 分钟
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
