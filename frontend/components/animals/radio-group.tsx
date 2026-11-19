type RadioGroupProps = {
  name: string;
  legend: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  required?: boolean;
};

// Grupo de opciones del Figma (círculos grises). Reutilizado en crear y editar.
export default function RadioGroup({ name, legend, options, defaultValue, required = false }: RadioGroupProps) {
  return (
    <fieldset>
      <legend className="text-sm">
        {legend}
        {required && <span className="text-[#E5484D]">*</span>}
      </legend>
      <div className="mt-2 flex flex-col gap-1">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name={name}
              value={option.value}
              defaultChecked={option.value === defaultValue}
              required={required}
              className="size-4 accent-[#005595]"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
