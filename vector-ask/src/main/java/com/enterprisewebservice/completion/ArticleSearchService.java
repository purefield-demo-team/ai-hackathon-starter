package com.enterprisewebservice.completion;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.MultivaluedHashMap;
import jakarta.ws.rs.core.MultivaluedMap;
import redis.clients.jedis.search.Document;
import redis.clients.jedis.search.SearchResult;

import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;

import com.enterprisewebservice.RedisSearchIndexer;
import com.enterprisewebservice.api.MessageChunkService;
import com.enterprisewebservice.embeddings.EmbeddingData;
import com.enterprisewebservice.embeddings.EmbeddingResponse;
import com.enterprisewebservice.embeddings.EmbeddingService;
import com.enterprisewebservice.model.MessageChunk;

import org.apache.commons.math3.linear.ArrayRealVector;
import org.apache.commons.math3.linear.RealVector;


@ApplicationScoped
public class ArticleSearchService {
    @Inject
    EmbeddingService embeddingService;

    @Inject
    RedisSearchIndexer redisSearchIndexer;

    @Inject
    MessageChunkService messageChunkService;

    public String searchArticles(String keycloakSubject, EmbeddingResponse queryEmbedding, int topN) throws Exception {
    
        // Search in Redis and get the embeddings
        List<Document> results = redisSearchIndexer.vectorSimilarityQuery(keycloakSubject, queryEmbedding);
        StringBuffer message = new StringBuffer();

        List<MessageChunk> messageChunks = redisSearchIndexer.getMessageChunks(results, messageChunkService);
        if(messageChunks.size() == 0) {
            return "No articles found";
        }
        int i = 0;
        while(i < messageChunks.size() && message.length() < 7500) {
            // Get the index, object, and embedding from the document
            String part = "";
            if(messageChunks.get(i).getNote() != null)
            {
                String title = "article " + i + ": " + messageChunks.get(i).getNote().getName();
                
                part = title;
            }
            
            String description = "description: " + messageChunks.get(i).getText();
            part = part + "\n" + description + "\n";
            System.out.println(part);
            // Check if adding the next part would exceed the limit
            if (message.length() + part.length() <= 7500) {
                // If it wouldn't, append the part
                message.append(part);
            }
            i++;
        }
         
        // Get the articles from the results
        return message.toString();

    }

}
