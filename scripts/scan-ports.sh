#!/usr/bin/env bash
# scan-cloudflared-ports.sh
# Find cloudflared metrics server and get active tunnel URL

for port in 2000 2001 2002 2003 2004 2005 2006 2007 2008 2009 2010 2011 2012 2013 2014 2015 2016 2017 2018 2019 2020; do
    r=$(curl -s --max-time 0.5 "http://127.0.0.1:${port}/" 2>/dev/null)
    if [ -n "$r" ]; then
        echo "Port ${port}: ${r}"
    fi
    qt=$(curl -s --max-time 0.5 "http://127.0.0.1:${port}/quicktunnel" 2>/dev/null)
    if [ -n "$qt" ]; then
        echo "Quicktunnel at ${port}: ${qt}"
    fi
done
echo "Scan complete"
