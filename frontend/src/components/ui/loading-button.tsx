import { DotStream } from 'ldrs/react'
import 'ldrs/react/DotStream.css'

type ColorProps = {
  color?: string;
}

function LoadingButton({ color }: ColorProps) {
  return (
    <DotStream
      size="60"
      speed="2.5"
      color={color ?? 'black'}
    />
  );
}

export default LoadingButton;
