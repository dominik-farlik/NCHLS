export default function WarningButton({title, onClick}: {title: string, onClick: () => void}) {

    return (
        <button type="button" onClick={onClick}
                className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors shadow-sm">
            {title}
        </button>
    )
}