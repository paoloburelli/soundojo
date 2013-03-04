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
@synthesize loadingImageView;

- (void)applicationDidFinishLaunching:(NSNotification *)aNotification
{
    NSString *strIndirizzo = @"http://www.soundojo.com/webapp/";
	NSURL *url = [NSURL URLWithString:strIndirizzo];
    SounDojo.hidden = YES;
    [[SounDojo mainFrame] loadRequest:[NSURLRequest requestWithURL:url]];
    [loadingImageView.layer setBackgroundColor:CGColorCreateGenericRGB(0.0, 0.0, 0.0, 1.0)];
    [SounDojo setFrameLoadDelegate:self];
}


-(void)webView:(WebView *)sender didFinishLoadForFrame:(WebFrame *)frame
{
    SounDojo.hidden = NO;
    loadingImageView.hidden = YES;
    [SounDojo stringByEvaluatingJavaScriptFromString:@"start();"];
}

@end
