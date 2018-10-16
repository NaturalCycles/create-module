export function packageJsonTemplate (): any {
  return {
    scripts: {},
    dependencies: {},
    devDependencies: {},
    files: ['dist'],
    engines: {
      node: '>=8.11',
      yarn: '>=1.10.1',
    },
    version: '1.0.0',
    description: '',
  }
}
