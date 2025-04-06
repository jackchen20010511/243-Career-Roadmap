"use client";

export default function LearningDuration({ duration, setDuration, durationUnit, setDurationUnit }) {
    const convertToWeeks = (value: string, unit: string) => {
        let totalWeeks = parseInt(value) || 0;
        if (unit === "months") totalWeeks *= 4;
        if (unit === "years") totalWeeks *= 52;
        return totalWeeks;
    };

    return (
        <>
            <h2 className="mb-8 animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,var(--color-gray-200),var(--color-indigo-200),var(--color-gray-50),var(--color-indigo-300),var(--color-gray-200))] bg-[length:200%_auto] bg-clip-text pb-4 font-nacelle text-3xl font-semibold text-transparent md:text-4xl">
                Total Duration of Learning
            </h2>
            <div className="flex space-x-4">
                <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="p-4 border border-gray-600 bg-gray-700 text-white rounded-lg text-lg w-2/3 no-spinner"
                    placeholder="Enter a number"
                />
                <select
                    value={durationUnit}
                    onChange={(e) => setDurationUnit(e.target.value)}
                    className="p-4 border border-gray-600 bg-gray-700 text-white rounded-lg text-lg w-1/3"
                >
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                </select>
            </div>
            <p className="mt-3 text-gray-400">This is approximately <span className="font-semibold">{convertToWeeks(duration, durationUnit)}</span> weeks.</p>
        </>
    );
}
