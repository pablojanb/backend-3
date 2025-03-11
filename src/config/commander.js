import { program } from "commander"

program.option('--modo <modo>' , 'Modo de ejecucion', 'dev')
program.parse()

export default program.opts()