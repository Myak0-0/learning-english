import { useEffect, useState, useRef } from "react";
import { Tldraw } from "tldraw";
import 'tldraw/tldraw.css';
import axios from "axios";

const Desk = ({ topicId }) => {
    const [editor, setEditor] = useState(null);
    const isRemoteUpdate = useRef(false);
    const saveTimeoutRef = useRef(null);
    
    const [lastUpdated, setLastUpdated] = useState(0);

    useEffect(() => {
        if (!editor) return;

        const interval = setInterval(() => {
            
            if (saveTimeoutRef.current) return;

            axios.post(`/topic/${topicId}/desk-check`)
                .then(res => {
                    const serverTime = res.data.last_update;
                    
                    if (serverTime > lastUpdated && res.data.snapshot) {
                        
                        isRemoteUpdate.current = true;
                        
                        const sanitized = JSON.parse(JSON.stringify(res.data.snapshot));
                        const sanitize = (obj) => {
                            if (obj && typeof obj === 'object') {
                                for (const key in obj) {
                                    if (obj[key] === null) {
                                        if (['name', 'imageUrl', 'userId', 'username', 'url', 'text', 'label'].includes(key) || typeof key === 'string') {
                                            obj[key] = "";
                                        }
                                    } else if (typeof obj[key] === 'object') {
                                        sanitize(obj[key]);
                                    }
                                }
                            }
                        };
                        sanitize(sanitized);

                        editor.loadSnapshot(sanitized);
                        setLastUpdated(serverTime);
                        
                        isRemoteUpdate.current = false;
                    }
                })
                .catch();

        }, 3000);

        return () => clearInterval(interval);
    }, [editor, topicId, lastUpdated]);

    useEffect(() => {
        if (!editor) return;

        const unlisten = editor.store.listen((update) => {
            const updated = update?.changes?.updated;
            const shapeKey = Object.keys(updated || {}).find(key => key.startsWith('shape:'));
            const type = shapeKey ? updated[shapeKey]?.[0]?.type : undefined;
            
            if (Object.keys(update?.changes?.added || {}).length == 0 && 
                Object.keys(update?.changes?.removed || {}).length == 0 &&
                type != 'text') {
                return;
            }

            if (isRemoteUpdate.current || update.source !== 'user') return;

            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }

            saveTimeoutRef.current = setTimeout(() => {
                const snapshot = editor.getSnapshot();

                axios.post(`/topic/${topicId}/desk-update`, {
                    snapshot: snapshot
                })
                .then(res => {
                    setLastUpdated(res.data.last_update);
                    saveTimeoutRef.current = null;
                })
                .catch(err => {
                    saveTimeoutRef.current = null;
                });
            }, 1000);
        });

        return () => {
            unlisten();
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, [editor, topicId]);

    return (
        <div className="desk">
            <Tldraw
                onMount={(editorInstance) => {
                    setEditor(editorInstance);
                }}
            />
        </div>
    );
};

export default Desk;
