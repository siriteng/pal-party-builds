const numericValue = /(x\([+-]?\d+(?:\.\d+)?(?:~[+-]?\d+(?:\.\d+)?)?\)|\([+-]?\d+(?:\.\d+)?(?:~[+-]?\d+(?:\.\d+)?)?\)%?|x[+-]?\d+(?:\.\d+)?(?:~[+-]?\d+(?:\.\d+)?)?|[+-]?\d+(?:\.\d+)?(?:~[+-]?\d+(?:\.\d+)?)?%?)/gi;
const numericValueOnly = /^(?:x\([+-]?\d+(?:\.\d+)?(?:~[+-]?\d+(?:\.\d+)?)?\)|\([+-]?\d+(?:\.\d+)?(?:~[+-]?\d+(?:\.\d+)?)?\)%?|x[+-]?\d+(?:\.\d+)?(?:~[+-]?\d+(?:\.\d+)?)?|[+-]?\d+(?:\.\d+)?(?:~[+-]?\d+(?:\.\d+)?)?%?)$/i;

function displayValue(value: string) {
  return value
    .replace(/^x\(/i, "×")
    .replace(/^x/i, "×")
    .replace(/^\(/, "")
    .replace(/\)(%?)$/, "$1")
    .replace(/~/g, "–");
}

export function SkillEffect({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {text.split(numericValue).map((part, index) => numericValueOnly.test(part)
        ? <strong key={`${part}-${index}`}>{displayValue(part)}</strong>
        : part)}
    </span>
  );
}
