//
//  MyApp.m
//  SounDojo
//
//  Created by Paolo Burelli on 3/4/13.
//  Copyright (c) 2013 Paolo Burelli. All rights reserved.
//

#import "MyApp.h"

@implementation MyApp

@synthesize SounDojo;

- (void)sendEvent:(NSEvent *)event
{
    // Catch media key events
    if ([event type] == NSSystemDefined && [event subtype] == 8)
    {
        int keyCode = (([event data1] & 0xFFFF0000) >> 16);
        int keyFlags = ([event data1] & 0x0000FFFF);
        int keyState = (((keyFlags & 0xFF00) >> 8)) == 0xA;
        
        // Process the media key event and return
        [self mediaKeyEvent:keyCode state:keyState];
        return;
    }
    
    // Continue on to super
    [super sendEvent:event];
}

- (void)mediaKeyEvent:(int)key state:(BOOL)state
{
    switch (key)
    
    {
        // Play pressed
        case NX_KEYTYPE_PLAY:
            if (state == NO)
                 [SounDojo stringByEvaluatingJavaScriptFromString:@"sounDojo.playpause()"];
            break;
            
        // Rewind
        case NX_KEYTYPE_FAST:
            if (state == YES)
                [SounDojo stringByEvaluatingJavaScriptFromString:@"sounDojo.next()"];
            break;
            
        // Previous
        case NX_KEYTYPE_REWIND:
            if (state == YES)
                [SounDojo stringByEvaluatingJavaScriptFromString:@"sounDojo.prev()"];
            break;
    }
}

@end
