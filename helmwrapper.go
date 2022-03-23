package main

import (
	"bytes"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path"
)

// find out $0 path
// switch working dir there
// exec command
func main() {

	abs, _ := os.Executable()
	abs = path.Dir(abs)

	m := len(os.Args)
	args := os.Args[1:m]

	args[m-1-1] = path.Join(abs, args[m-1-1])
	fmt.Println(args)

	command := exec.Command(path.Join(abs, "helm"), args...)

	var stdout bytes.Buffer
	var stderr bytes.Buffer
	command.Stdout = &stdout
	command.Stderr = &stderr

	err := command.Run()
	if err != nil {
		log.Println(err)
	}

	fmt.Fprint(os.Stderr, stderr.String())
	fmt.Fprint(os.Stdout, stdout.String())
	os.Exit(command.ProcessState.ExitCode())
}
