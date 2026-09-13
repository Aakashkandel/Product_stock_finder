/**
 * Generates the SHA-256 digest to put in VITE_ADMIN_PASSWORD_HASH.
 *
 *   node scripts/hash-password.mjs 'your-password'
 */
import { createHash } from 'node:crypto'
import { createInterface } from 'node:readline/promises'

const fromArgv = process.argv[2]

const password = fromArgv ?? await (async () => {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const answer = await rl.question('Password: ')
  rl.close()
  return answer
})()

if (!password) {
  console.error('No password given.')
  process.exit(1)
}

const hash = createHash('sha256').update(password, 'utf8').digest('hex')

console.log('\nAdd these to your .env (or your host\'s environment variables):\n')
console.log('VITE_ADMIN_USERNAME=admin')
console.log(`VITE_ADMIN_PASSWORD_HASH=${hash}\n`)
