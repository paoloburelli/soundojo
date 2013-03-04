//
//  AppDelegate.h
//  SounDojo
//
//  Created by Paolo Burelli on 3/1/13.
//  Copyright (c) 2013 Paolo Burelli. All rights reserved.
//

#import <Cocoa/Cocoa.h>
#import <WebKit/WebKit.h>

@interface AppDelegate : NSObject <NSApplicationDelegate>

@property (assign) IBOutlet NSWindow *window;
@property (nonatomic, retain) IBOutlet WebView *SounDojo;

@end