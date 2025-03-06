export default async function Component({
  subtitle,
  price,
}: {
  subtitle: string;
  price: string;
}) {
  return (
    <div className="rounded-lg md:my-auto w-full border border-gray-100 bg-white shadow-lg  hover:border-emerald-400 transition-all duration-300 hover:shadow-emerald-100">
      <div className="py-4 px-8 h-full flex flex-col">
        <div className="flex flex-row justify-between">
          <h3 className="text-base font-semibold text-purple-600">
            {subtitle}
          </h3>
        </div>
        <p className="text-xl font-bold text-black mt-4">{price}</p>
      </div>
    </div>
  );
}
