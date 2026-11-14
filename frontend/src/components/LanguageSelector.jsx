
const languages = [
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "es", name: "Spanish", native: "Español" },
];

export default function LanguageSelector({
  value,
  onChange,
}) {
  return (
    <div className="language-selector">
      <label htmlFor="target-language">
        Translate into
      </label>

      <select
        id="target-language"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {languages.map((language) => (
          <option
            key={language.code}
            value={language.code}
          >
            {language.name} — {language.native}
          </option>
        ))}
      </select>
    </div>
  );
}
