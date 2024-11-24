package com.enterprisewebservice;

import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.stream.Collectors;

import com.enterprisewebservice.api.MessageChunkService;
import com.enterprisewebservice.api.NoteService;
import com.enterprisewebservice.completion.QuestionParameters;
import com.enterprisewebservice.embeddings.EmbeddingData;
import com.enterprisewebservice.embeddings.EmbeddingResponse;
import com.enterprisewebservice.model.MessageChunk;
import com.enterprisewebservice.model.Note;
import com.enterprisewebservice.model.StrapiServiceResponse;
import com.enterprisewebservice.model.Task;

import jakarta.inject.Inject;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPooled;
import redis.clients.jedis.exceptions.JedisDataException;
import redis.clients.jedis.search.Document;
import redis.clients.jedis.search.IndexDefinition;
import redis.clients.jedis.search.IndexOptions;
import redis.clients.jedis.search.Query;
import redis.clients.jedis.search.Schema;
import redis.clients.jedis.search.SearchResult;
import redis.clients.jedis.search.schemafields.VectorField;



public class RedisSearchIndexer {

    private JedisPooled jedis;
    private JedisPool jedisPool;
    private static final String VECTOR_DIM = "1536";
    private static final String VECTOR_NUMBER = "1600";
    private static final String INDEX_NAME = "nizer5-embeddings";
    //private static final String PREFIX = "goalora:";
    private static final String DISTANCE_METRIC = "COSINE";

    public RedisSearchIndexer(JedisPooled jedis, JedisPool jedisPool) {
        this.jedis = jedis;
        this.jedisPool = jedisPool;
    }

    public void createIndex() {

        // Define the default algorithm
        VectorField.VectorAlgorithm defaultAlgorithm = VectorField.VectorAlgorithm.FLAT;
    
        // Set defaultAttributes for the embedding_vector field
        Map<String, Object> defaultAttributes = new HashMap<>();
        defaultAttributes.put("TYPE", "FLOAT32");
        defaultAttributes.put("DIM", VECTOR_DIM);
        defaultAttributes.put("DISTANCE_METRIC", DISTANCE_METRIC);
        defaultAttributes.put("INITIAL_CAP", VECTOR_NUMBER);
    
        // Create the schema
        Schema sc = new Schema()
        .addFlatVectorField("embedding", defaultAttributes)
        .addTextField("subjectsearch", 1.0)
        .addTagField("task_ids", ","); // Specify comma as the separator

    
        // Define the prefixes
        IndexOptions indexOptions = IndexOptions.defaultOptions();
        IndexDefinition indexDefinition = new IndexDefinition();
        indexDefinition.setScore(0);
        indexDefinition.setPrefixes("doc:"); // set your prefix here
        indexOptions.setDefinition(indexDefinition);
        
        try {
            var query = new Query("*");
            jedis.ftSearch(INDEX_NAME, query);
            System.out.println("Index already exists");
        } catch (JedisDataException ex) {
            // Create the index
            jedis.ftCreate(INDEX_NAME, indexOptions, sc);
            System.out.println("Index created successfully");
        }
    }
    


    public void indexEmbeddings(EmbeddingResponse embeddingResponse, String customKey, List<String> texts, String keycloakSubject, List<Long> taskIds) {
        for (EmbeddingData embeddingData : embeddingResponse.getData()) {
            String key = "doc:" + customKey + "-" + embeddingData.getIndex();
            
            // Convert embeddings to byte arrays
            byte[] embedding = null;
            try {
                embedding = floatArrayToBytesLittleEndianOrder(embeddingData.getEmbedding().toArray(new Float[0]));
            } catch (IOException e) {
                e.printStackTrace();
            }
            
            // Create a new hash in Redis for the document
            Map<byte[], byte[]> hash = new HashMap<>();
            hash.put("index".getBytes(StandardCharsets.UTF_8), Integer.toString(embeddingData.getIndex()).getBytes(StandardCharsets.UTF_8));
            hash.put("embedding".getBytes(StandardCharsets.UTF_8), embedding);
            hash.put("subject".getBytes(StandardCharsets.UTF_8), keycloakSubject.getBytes(StandardCharsets.UTF_8));
            hash.put("subjectsearch".getBytes(StandardCharsets.UTF_8), keycloakSubject.replaceAll("-", "").getBytes(StandardCharsets.UTF_8));
            hash.put("title".getBytes(StandardCharsets.UTF_8), customKey.getBytes(StandardCharsets.UTF_8));
            hash.put("description".getBytes(StandardCharsets.UTF_8), texts.get(embeddingData.getIndex()).getBytes(StandardCharsets.UTF_8));

           // Store task IDs as a comma-separated string without spaces
            if (taskIds != null && !taskIds.isEmpty()) {
                String taskIdsString = taskIds.stream()
                    .map(Object::toString)
                    .collect(Collectors.joining(","));
                hash.put("task_ids".getBytes(StandardCharsets.UTF_8), taskIdsString.getBytes(StandardCharsets.UTF_8));
            }

            jedis.hset(key.getBytes(StandardCharsets.UTF_8), hash);
        }
    }



    public void deleteEmbedding(String customKey, Note note) {
        for (int i = 0; i < (note.getChunks() != null ? note.getChunks() : 5); i++) {
            String key = customKey + "-" + i;
            System.out.println("Deleting key: " + key);
            jedis.del(key.getBytes());
        }
    }

    public void dropIndex(String indexName)
    {
        jedis.ftDropIndex(indexName);
    }

    public void deleteDocuments()
    {
        jedis.flushAll();
    }

    public static byte[] floatArrayToBytesLittleEndianOrder(Float[] vector) throws IOException {
        ByteArrayOutputStream bas = new ByteArrayOutputStream();
        DataOutputStream dos = new DataOutputStream(bas);
        for (float f : vector) {
            byte[] bytes = getBytesLittleEndianOrder(f);
            dos.write(bytes);
        }
        return bas.toByteArray();
    }

    private static byte[] getBytesLittleEndianOrder(float f) {
        int intBits =  Float.floatToIntBits(f);
        return new byte[]{(byte) (intBits), (byte) (intBits >> 8), (byte) (intBits >> 16), (byte) (intBits >> 24)};
    }
    

    public List<Document> vectorSimilarityQuery(QuestionParameters parameters, EmbeddingResponse queryEmbedding) {
        List<Document> documents = null;
        String vectorKey = "embedding";
    
        List<EmbeddingData> queryEmbeddingData = queryEmbedding.getData();
    
        for (EmbeddingData eData : queryEmbeddingData) {
            byte[] queryVector = null;
            try {
                queryVector = floatArrayToBytesLittleEndianOrder(eData.getEmbedding().toArray(new Float[0]));
            } catch (IOException e) {
                e.printStackTrace();
            }
    
            String keycloakSubject = parameters.getSubject();
            String keycloakSubjectSearch = keycloakSubject.replaceAll("-", "");
    
            // Prepare task IDs for the query
            List<Long> taskIds = parameters.getTaskIds();
            String taskIdsQuery = "";
            if (taskIds != null && !taskIds.isEmpty()) {
                String taskIdsString = taskIds.stream()
                    .map(Object::toString)
                    .collect(Collectors.joining("|"));
                taskIdsQuery = "(@task_ids:{" + taskIdsString + "})";
            }
    
            String hybridFields = "(@subjectsearch:" + keycloakSubjectSearch + ")" + (taskIdsQuery.isEmpty() ? "" : " " + taskIdsQuery);
            String searchQueryText = hybridFields + "=>[KNN 30 @" + vectorKey + " $vector]";
    
            // Create a new search query
            Query searchQuery = new Query(searchQueryText)
                .addParam("vector", queryVector)
                .setSortBy("__" + vectorKey + "_score", true)
                .returnFields("title", "description", "index", "__" + vectorKey + "_score", "subjectsearch")
                .dialect(2);
    
            // Execute the search query
            SearchResult searchResult = jedis.ftSearch(INDEX_NAME, searchQuery);
            documents = searchResult.getDocuments();
        }
    
        return documents;
    }       

    public List<String> toListString(List<Float> vector) {
        return vector.stream()
                     .map(Object::toString)
                     .collect(Collectors.toList());
    }

    public List<MessageChunk> getMessageChunks(List<Document> documents, MessageChunkService messageChunkService) {
        // Convert the search results to a list of EmbeddingData
        List<MessageChunk> messageChunks = new ArrayList<>();
        
        int i = 0;
        System.out.println("Number of documents: " + documents.size());
        // While there are still documents and the message doesn't exceed the limit
        while (i < documents.size()) {
            Document doc = documents.get(i);
            
            MessageChunk messageChunk = messageChunkService.initializeMessageChunk(doc);

            messageChunks.add(messageChunk);
            // Increment the index
            i++;
        }
        
        return messageChunks;
    }


    private byte[] toByteArray(List<Float> list) {
        ByteBuffer byteBuffer = ByteBuffer.allocate(Float.SIZE / Byte.SIZE * list.size());

        for (float val : list) {
            byteBuffer.putInt(Float.floatToIntBits(val));
        }

        byte[] byteArray = byteBuffer.array();

        // Printing the byte array for testing
        return byteArray;
    }
}