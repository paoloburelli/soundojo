//
//  MyApp.h
//  SounDojo
//
//  Created by Paolo Burelli on 3/4/13.
//  Copyright (c) 2013 Paolo Burelli. All rights reserved.
//

#import <Cocoa/Cocoa.h>
#import <WebKit/WebKit.h>
#import <IOKit/hidsystem/ev_keymap.h>

@interface MyApp : NSApplication
    @property (nonatomic, retain) IBOutlet WebView *SounDojo;
@end
