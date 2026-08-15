const EASE = "ease-[cubic-bezier(0.65,0,0.076,1)]";

export function ResponsiveButton() {
  return (
    <span
      className="group relative inline-block w-48 cursor-pointer align-middle"
      role="presentation"
    >
      <span
        className={`relative m-0 block h-12 w-12 rounded-full bg-brand transition-all duration-[450ms] ${EASE} group-hover:w-full`}
      >
        <span
          aria-hidden="true"
          className={`absolute inset-y-0 left-2.5 my-auto h-0.5 w-[1.125rem] bg-transparent transition-all duration-[450ms] ${EASE} group-hover:translate-x-4 group-hover:bg-white`}
        >
          <span className="absolute -top-[0.29rem] right-[0.0625rem] h-2.5 w-2.5 rotate-45 border-r-2 border-t-2 border-white" />
        </span>
      </span>
      <span
        className={`absolute inset-0 ml-[1.85rem] py-3 text-center text-sm font-bold uppercase leading-[1.6] tracking-wide text-brand transition-all duration-[450ms] ${EASE} group-hover:text-white`}
      >
        Learn More
      </span>
    </span>
  );
}

export default ResponsiveButton;
