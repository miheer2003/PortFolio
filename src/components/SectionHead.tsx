const SectionHead = ({ index, label }: { index: string; label: string }) => (
  <div className="sec-head">
    <span className="mono sec-index">({index})</span>
    <span className="mono">{label}</span>
    <span className="sec-line" aria-hidden="true" />
  </div>
);

export default SectionHead;
