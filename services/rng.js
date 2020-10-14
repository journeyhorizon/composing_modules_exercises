import crypto from 'crypto';

export default function rng() {
  const rnds8Pool = new Uint8Array(256); // # of random values to pre-allocate
  let poolPtr = rnds8Pool.length;

  if (poolPtr > rnds8Pool.length - 16) {
    crypto.randomFillSync(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, (poolPtr += 16));
}