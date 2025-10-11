// components/Footer.tsx
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12 py-6 text-center border-t border-gray-200">
      <div className="flex flex-col items-center justify-center space-y-2">
        {/* CTA Section */}
        <p className="text-sm text-gray-600 max-w-md">
          <strong>Activate your chance today —</strong> Your Small Act of participation helps{" "}
          <span className="font-semibold text-pink-600">Heart Heroes Support Foundation</span> 
          support a sick child with medical bills, surgery costs, and medication access.
        </p>

        {/* Humanity tagline + logo */}
        <div className="flex items-center justify-center space-x-2 mt-4">
          <p className="text-gray-700 text-sm">
            Humanity starts with compassion...{" "}
            <Link
              href="https://heatheroes.org.ng/campaigns"
              target="_blank"
              className="text-pink-600 font-semibold hover:underline"
            >
              Make an impact
            </Link>
          </p>
          <Link
            href="https://heatheroes.org.ng/campaigns"
            target="_blank"
            className="animate-pulse"
          >
            <Image
              src="/images/heart-heroes-logo.png"
              alt="Heart Heroes Logo"
              width={30}
              height={30}
              className="ml-2"
            />
          </Link>
        </div>
      </div>
    </footer>
  );
}
