type DashboardHeaderProps = {
  buttonText: string;
  onButtonClick: () => void;
  searchPlaceholder?: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
};

export default function DashboardHeader({
  buttonText,
  onButtonClick,
  searchPlaceholder = "Search",
  searchQuery,
  onSearchChange,
}: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-6">
      <label className="sr-only" htmlFor="dashboard-search">
        Search jobs and work reports
      </label>
      <input
        id="dashboard-search"
        type="search"
        placeholder={searchPlaceholder}
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
        className="w-full max-w-sm rounded-md border-[3px] border-black px-3 py-2 text-xl text-park-gray outline-none transition focus:border-park-green"
      />

      <button
        type="button"
        onClick={onButtonClick}
        className="rounded-md bg-park-green px-10 py-3 transition-all duration-200 text-xl text-white cursor-pointer hover:bg-park-green-dark"
      >
        {buttonText}
      </button>
    </header>
  );
}
