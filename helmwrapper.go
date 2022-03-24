package main

import (
	"bytes"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path"
	"path/filepath"
)

// find out $0 path
// switch working dir there
// exec command
func main() {
	abs, err := os.Executable()
	if err != nil {
		log.Println("warning: cannot determine executables path")
	}
	abs = filepath.Dir(abs)

	if abs == "" || abs == "." {
		log.Println("warning: executables path is empty")
	}

	helm := path.Join(abs, "helm")

	m := len(os.Args)
	if m < 4 {
		log.Println("usage: helmwrapper install release FILE")
		os.Exit(1)
	}

	args := os.Args[1:m]
	m = len(args)
	args[m-1] = path.Join(abs, args[m-1])

	fmt.Printf("running: %s %v\n", helm, args)
	command := exec.Command(helm, args...)

	var stdout bytes.Buffer
	var stderr bytes.Buffer
	command.Stdout = &stdout
	command.Stderr = &stderr

	err = command.Run()
	if err != nil {
		log.Println(err)
	}

	fmt.Fprint(os.Stderr, stderr.String())
	fmt.Fprint(os.Stdout, stdout.String())
	os.Exit(command.ProcessState.ExitCode())
}
