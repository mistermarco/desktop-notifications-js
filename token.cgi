#!/usr/bin/perl

use CGI;
use Data::Dumper;
use POSIX;

my $q = new CGI;

print $q->header;

my $expiration_time = $ENV{'WEBAUTH_TOKEN_EXPIRATION'};
my $now = time();

my $minutes_left     = ceil(($expiration_time - $now) / 60);

print $minutes_left;
