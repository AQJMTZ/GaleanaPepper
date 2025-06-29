import type { SVGProps } from "react"
import Image from "next/image"

export const Logo = (props: SVGProps<SVGSVGElement> & { className?: string }) => (
  // Usando la imagen de favicon.jpg como logo temporal
  <div className={props.className}>
    <Image 
      src="/favicon.jpg" 
      alt="Galeana Pepper Logo" 
      width={133} 
      height={133}
      style={{ objectFit: 'contain' }}
    />
  </div>
)
