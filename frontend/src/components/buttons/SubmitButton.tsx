export default function SubmitButton({title, disabled = false}: {title: string, disabled?: boolean}) {
    return (
        <button
            type="submit"
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-8 rounded-lg shadow-sm hover:shadow transition-all focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900"
            disabled={disabled}
        >
            {title}
        </button>
    )
}