export default function StopInput({ value, onChange, onSubmit }) {
  return (
    <>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="输入站点名，如 Borstei"
      />
      <button onClick={onSubmit}>查询并通知</button>
    </>
  );
}
