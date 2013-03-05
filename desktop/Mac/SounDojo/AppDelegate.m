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

NSString *appUrl=@"http://www.soundojo.com/webapp/";
NSString *localStorage = @"/Library/Application Support/SounDojo";


+ (void)loadLocalStorage{
    NSString *target = [localStorage stringByAppendingString:@"/http_soundojo.com_0.localstorage"];
    NSString *source = [target stringByAppendingString:@".saved"];
    [[NSFileManager defaultManager] copyItemAtPath:source  toPath:target error:nil];
}

+ (void)saveLocalStorage{
    NSString *source = [localStorage stringByAppendingString:@"/http_soundojo.com_0.localstorage"];
    NSString *target = [source stringByAppendingString:@".saved"];
    if ([[NSFileManager defaultManager] fileExistsAtPath:source]) {
        [[NSFileManager defaultManager] removeItemAtPath:target error:nil];
        [[NSFileManager defaultManager] copyItemAtPath:source  toPath:target error:nil];
    }
}

- (void)applicationDidFinishLaunching:(NSNotification *)aNotification
{
    localStorage = [NSHomeDirectory() stringByAppendingString:localStorage];
    
    [AppDelegate loadLocalStorage];
    
    WebPreferences* prefs = [SounDojo preferences];
    [prefs _setLocalStorageDatabasePath:localStorage];
    [prefs setLocalStorageEnabled:YES];
    
	NSURL *url = [NSURL URLWithString:appUrl];
    SounDojo.hidden = YES;
    [[SounDojo mainFrame] loadRequest:[NSURLRequest requestWithURL:url]];
    [loadingImageView.layer setBackgroundColor:CGColorCreateGenericRGB(0.0, 0.0, 0.0, 1.0)];
    [SounDojo setFrameLoadDelegate:self];

}

- (void)applicationWillTerminate:(NSNotification *)aNotification{
    [AppDelegate saveLocalStorage];
}


-(void)webView:(WebView *)sender didFinishLoadForFrame:(WebFrame *)frame
{
    SounDojo.hidden = NO;
    loadingImageView.hidden = YES;
    [SounDojo stringByEvaluatingJavaScriptFromString:@"start(); $('#appLogo').css('visibility','hidden')"];
}

- (BOOL)applicationShouldTerminateAfterLastWindowClosed:(NSApplication *)sender
{
    return YES;
}

@end
