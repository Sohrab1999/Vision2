#!/usr/bin/env python3
"""r269: double-fork daemonizer — escape the tool-call process cleanup.

The ZAI tool service reaps every process spawned by a Bash tool call once
the call ends (observed r269: dev server + judge died twice). The platform's
own long-lived daemons (agent-browser) survive because they double-fork and
orphan-reparent to PID 1 (tini). Replicate exactly that:

  fork #1 (parent exits) -> setsid -> fork #2 (parent exits) -> exec service

Usage: python3 daemonize-r269.py <workdir> <logfile> <cmd> [args...]
"""
import os
import sys


def daemonize_and_exec(cmd):
    # fork #1: parent exits immediately so the child is orphaned
    pid = os.fork()
    if pid > 0:
        sys.exit(0)
    os.setsid()
    # fork #2: fully detach from the controlling terminal
    pid = os.fork()
    if pid > 0:
        sys.exit(0)
    # grandchild: reparented to PID 1, exec the service
    os.execvp(cmd[0], cmd)


def main():
    workdir, logfile = sys.argv[1], sys.argv[2]
    cmd = sys.argv[3:]
    os.chdir(workdir)
    fd = os.open(logfile, os.O_WRONLY | os.O_CREAT | os.O_APPEND, 0o644)
    os.dup2(fd, 1)
    os.dup2(fd, 2)
    devnull = os.open(os.devnull, os.O_RDONLY)
    os.dup2(devnull, 0)
    daemonize_and_exec(cmd)


if __name__ == "__main__":
    main()
