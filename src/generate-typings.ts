import { GraphQLDefinitionsFactory } from '@nestjs/graphql'
import { join } from 'path'

const definitionsFactory = new GraphQLDefinitionsFactory()
process.argv[2] = process.argv[2] ?? false.toString()
let watch: true | false
try {
  watch = JSON.parse(process.argv[2])
} catch (error) {
  watch = false
}

definitionsFactory.generate({
  typePaths: ['./src/**/*.graphql'],
  path: join(process.cwd(), 'src/graphql.ts'),
  watch,
})
