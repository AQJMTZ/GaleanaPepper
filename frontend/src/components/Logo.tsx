import type { SVGProps } from "react"
import Image from "next/image"

export const Logo = (props: SVGProps<SVGSVGElement> & { className?: string }) => (
  <div className={props.className}>
    <Image 
      src="/favicon.jpg" 
      alt="Galeana Pepper Logo" 
      width={52} 
      height={52}
      style={{ objectFit: 'contain', border: 'none' }}
    />
  </div>
)
