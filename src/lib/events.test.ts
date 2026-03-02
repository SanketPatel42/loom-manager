/**
 * Test file to verify the automatic data synchronization system
 * This can be run in the browser console or as a manual test
 */

import { emitDataChange, onDataChange } from '@/lib/events';

export function testEventSystem() {
    console.log('🧪 Testing Event System...');

    // Set up a listener
    let eventReceived = false;
    const unsubscribe = onDataChange((event) => {
        console.log('✅ Event received:', event.detail);
        eventReceived = true;
    });

    // Emit a test event
    emitDataChange('test', 'create', '123');

    // Check if event was received
    setTimeout(() => {
        if (eventReceived) {
            console.log('✅ Event system test PASSED');
        } else {
            console.error('❌ Event system test FAILED - event not received');
        }

        // Clean up
        unsubscribe();
    }, 100);
}

export function testMultipleListeners() {
    console.log('🧪 Testing Multiple Listeners...');

    let listener1Called = false;
    let listener2Called = false;

    const unsubscribe1 = onDataChange(() => {
        listener1Called = true;
    });

    const unsubscribe2 = onDataChange(() => {
        listener2Called = true;
    });

    emitDataChange('test', 'update', '456');

    setTimeout(() => {
        if (listener1Called && listener2Called) {
            console.log('✅ Multiple listeners test PASSED');
        } else {
            console.error('❌ Multiple listeners test FAILED');
        }

        unsubscribe1();
        unsubscribe2();
    }, 100);
}

// Run all tests
export function runAllTests() {
    testEventSystem();
    setTimeout(() => testMultipleListeners(), 200);
}
