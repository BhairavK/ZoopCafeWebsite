import {
  Headphones,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";

function Footer() {
  const features = [
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Hot & fresh to your doorstep",
    },
    {
      icon: Star,
      title: "Best Quality",
      description: "Made with quality ingredients",
    },
    {
      icon: ShieldCheck,
      title: "Safe & Secure",
      description: "Your orders are always protected",
    },
    {
      icon: Headphones,
      title: "Need Help?",
      description: "We're here whenever you need us",
    },
  ];

  return (
    <footer className="mt-20 border-t border-white/10 bg-[#090909]">

      {/* Features */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-white/10 px-5 py-12 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4 lg:px-10">

        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <div
              key={feature.title}
              className="flex items-center gap-4 px-4 py-6 sm:px-6 lg:py-4"
            >
              <Icon
                size={38}
                strokeWidth={1.5}
                className="shrink-0 text-[#D92323]"
              />

              <div>
                <h3 className="heading-font text-xl uppercase tracking-wide text-white">
                  {feature.title}
                </h3>

                <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}

      </div>

      {/* Bottom */}
      <div className="border-t border-white/10 px-5 py-6 text-center">
        <p className="text-xs text-gray-500 sm:text-sm">
          © {new Date().getFullYear()}{" "}
          <span className="font-medium text-gray-300">
            Zoop Cafe
          </span>
          . All rights reserved.
        </p>
      </div>

    </footer>
  );
}

export default Footer;