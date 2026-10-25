import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const root = path.resolve(__dirname, '../..')

function read (relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

describe('published image env', () => {
  it('does not bake an API key into the Docker build', () => {
    const workflow = read('.github/workflows/docker-image.yml')
    const dockerfile = read('Dockerfile')
    const example = read('.env.example')
    const dockerignore = read('.dockerignore')

    for (const source of [workflow, dockerfile, example]) {
      expect(source).not.toContain('NEXT_PUBLIC_API_KEY')
    }

    expect(workflow).not.toMatch(/^\s*API_KEY=/m)
    expect(dockerfile).not.toMatch(/^(ENV|ARG)\s+API_KEY\b/m)
    expect(dockerfile).not.toMatch(/\.env\.production/)
    expect(dockerignore).not.toMatch(/^!\.env\.production$/m)
  })
})
