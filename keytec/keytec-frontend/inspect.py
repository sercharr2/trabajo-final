from pathlib import Path
import struct, json
p = Path('public/blankkeycap.glb')
data = p.read_bytes()
if data[:4] != b'glTF':
    raise SystemExit('Not glTF')
version, length = struct.unpack_from('<II', data, 8)
print('version', version, 'length', length)
offset = 12
while offset < len(data):
    chunk_len, chunk_type = struct.unpack_from('<I4s', data, offset)
    offset += 8
    chunk_data = data[offset:offset+chunk_len]
    offset += chunk_len
    print('chunk', chunk_type.decode('ascii'), chunk_len)
    if chunk_type == b'JSON':
        js = json.loads(chunk_data.decode('utf-8'))
        print('scene count', len(js.get('scenes', [])))
        print('nodes count', len(js.get('nodes', [])))
        print('meshes count', len(js.get('meshes', [])))
        print('nodes sample', js.get('nodes')[:5])
        break
