//
//  AppDelegate.m
//  SounDojo
//
//  Created by Paolo Burelli on 3/1/13.
//  Copyright (c) 2013 Paolo Burelli. All rights reserved.
//

#import "AppDelegate.h"

@implementation AppDelegate

@synthesize window = _window;
@synthesize SounDojo;

- (void)applicationDidFinishLaunching:(NSNotification *)aNotification
{
    NSString *urlText = @"/index.html";
    [[SounDojo mainFrame] loadRequest:[NSURLRequest requestWithURL:[NSURL fileURLWithPath:urlText]]];
}

@end
